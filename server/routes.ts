import type { Express } from "express";
import { createServer, type Server } from "http";
import multer from "multer";
import { storage } from "./storage";
import { setupAuth, requireAuth, requireAdmin } from "./auth";
import { z } from "zod";
import { insertUserSchema, loginUserSchema } from "@shared/schema";
// plantIdService imported lazily when needed
import { plantsCatalogService } from "./services/plantsCatalog";
import openaiService from "./services/openai";
import { carePlannerService } from "./services/carePlanner";
import { pdfService } from "./services/pdf";

import { plantNamesService } from "./services/plantNames";
import { pricingService } from "./services/pricing";
import { PlantAnalysisService } from "./services/plantAnalysisService";
import { PDFReportService } from "./services/pdfReportService";
import { insertPlantResultSchema, insertBlogPostSchema, insertReviewSchema } from "@shared/schema";
import { trackUserLogin, trackPlantIdentification, trackSubscriptionPurchase, trackPdfDownload } from "./middleware/activityTracker";
import { registerAffiliateRoutes } from "./routes/affiliate";
import ebookRoutes from "./routes/ebookRoutes";
import expertRoutes from "./routes/expertRoutes";
import consultationRoutes from "./routes/consultationRoutes";
import blogRoutes from "./routes/blogRoutes";
import { registerAuthorRoutes } from "./routes/authorRoutes";
import studentRoutes from "./routes/studentRoutes";
import studentAdminRoutes from "./routes/studentAdminRoutes";
import gardenSubscriptionRoutes from "./routes/gardenSubscriptionRoutes";

import { GeographicRestrictionService } from "./services/geographicRestrictionService";
import { socialMediaService } from "./services/socialMediaService";
import gardenContentRoutes from "./routes/gardenContentRoutes";
import gardenMonitoringRoutes from "./routes/gardenMonitoringRoutes";

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 100 * 1024, // 100KB max per file
    files: 3,
  },
  fileFilter: (req, file, cb) => {
    // Only allow JPEG and PNG
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only JPEG and PNG images are allowed'));
    }
  },
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  setupAuth(app);

  // Register e-commerce routes
  registerAffiliateRoutes(app);
  
  // Register e-book marketplace routes
  app.use('/api/ebooks', ebookRoutes);
  
  // Register separate ebook categories route - connected to database
  app.get('/api/ebook-categories', async (req, res) => {
    try {
      const categories = await storage.getEbookCategories();
      res.json(categories);
    } catch (error) {
      console.error('Get ebook categories error:', error);
      res.status(500).json({ success: false, message: 'Failed to fetch categories' });
    }
  });
  
  // Register author registration routes
  registerAuthorRoutes(app);
  
  // Register expert onboarding routes
  app.use('/api', expertRoutes);
  
  // Register consultation routes
  app.use('/api', consultationRoutes);
  
  // Register blog routes
  app.use('/api/blog', blogRoutes);
  
  // Register student verification routes
  app.use('/', studentRoutes);
  
  // Register student admin routes
  app.use('/api/admin', studentAdminRoutes);
  
  // Register garden content management routes
  app.use('/api/garden-content', gardenContentRoutes);
  
  // Register garden monitoring premium routes
  app.use('/api/garden-monitoring', gardenMonitoringRoutes);
  
  // Register garden subscription routes
  app.use('/api/garden/subscription', gardenSubscriptionRoutes);
  
  // Geographic restrictions routes
  app.get('/api/geographic/check-product/:productId', async (req, res) => {
    try {
      const { productId } = req.params;
      const userLocation = await GeographicRestrictionService.detectUserLocation(req);
      
      const availability = await GeographicRestrictionService.checkProductAvailability(
        productId, 
        userLocation
      );
      
      res.json({
        success: true,
        availability,
        userLocation: { countryCode: userLocation.countryCode }
      });
    } catch (error) {
      console.error('Error checking product availability:', error);
      res.status(500).json({ success: false, message: 'Failed to check availability' });
    }
  });

  app.get('/api/geographic/check-ebook/:ebookId', async (req, res) => {
    try {
      const { ebookId } = req.params;
      const userLocation = await GeographicRestrictionService.detectUserLocation(req);
      
      const availability = await GeographicRestrictionService.checkEbookAvailability(
        ebookId, 
        userLocation
      );
      
      res.json({
        success: true,
        availability,
        userLocation: { countryCode: userLocation.countryCode }
      });
    } catch (error) {
      console.error('Error checking e-book availability:', error);
      res.status(500).json({ success: false, message: 'Failed to check availability' });
    }
  });

  app.get('/api/geographic/available-products', async (req, res) => {
    try {
      const userLocation = await GeographicRestrictionService.detectUserLocation(req);
      const { category } = req.query;
      
      const availableProducts = await GeographicRestrictionService.filterAvailableProducts(
        userLocation, 
        category as string
      );
      
      res.json({
        success: true,
        products: availableProducts,
        userLocation: { countryCode: userLocation.countryCode },
        count: availableProducts.length
      });
    } catch (error) {
      console.error('Error filtering available products:', error);
      res.status(500).json({ success: false, message: 'Failed to fetch available products' });
    }
  });

  app.get('/api/geographic/available-ebooks', async (req, res) => {
    try {
      const userLocation = await GeographicRestrictionService.detectUserLocation(req);
      const { category } = req.query;
      
      const availableEbooks = await GeographicRestrictionService.filterAvailableEbooks(
        userLocation, 
        category as string
      );
      
      res.json({
        success: true,
        ebooks: availableEbooks,
        userLocation: { countryCode: userLocation.countryCode },
        count: availableEbooks.length
      });
    } catch (error) {
      console.error('Error filtering available e-books:', error);
      res.status(500).json({ success: false, message: 'Failed to fetch available e-books' });
    }
  });

  app.get('/api/geographic/stats', requireAdmin, async (req, res) => {
    try {
      const stats = await GeographicRestrictionService.getGeographicStats();
      res.json({ success: true, stats });
    } catch (error) {
      console.error('Error getting geographic stats:', error);
      res.status(500).json({ success: false, message: 'Failed to fetch stats' });
    }
  });

  app.post('/api/geographic/init-restrictions', requireAdmin, async (req, res) => {
    try {
      await GeographicRestrictionService.initializeDefaultRestrictions();
      res.json({ success: true, message: 'Default restrictions initialized' });
    } catch (error) {
      console.error('Error initializing restrictions:', error);
      res.status(500).json({ success: false, message: 'Failed to initialize restrictions' });
    }
  });
  
  // Initialize blog categories and auto-blog service on startup
  (async () => {
    try {
      const { seedBlogCategories } = await import('./services/blogSeeder');
      await seedBlogCategories();
      
      // Initialize auto-blog service (will start scheduling)
      await import('./services/autoBlogService');
      console.log('Auto-blog system initialized successfully');
    } catch (error) {
      console.error('Failed to seed blog categories or initialize auto-blog:', error);
    }
  })();

  // Admin user management routes
  app.get('/api/admin/users', requireAdmin, async (req: any, res) => {
    try {
      const users = await storage.getAllUsers();
      // Remove passwords from response
      const safeUsers = users.map(user => {
        const { password, ...safeUser } = user;
        return safeUser;
      });
      res.json(safeUsers);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  app.put('/api/admin/users/:id/admin', requireAdmin, async (req: any, res) => {
    try {
      const { id } = req.params;
      const { isAdmin } = req.body;
      const user = await storage.updateUserAdminStatus(id, isAdmin);
      const { password, ...safeUser } = user;
      res.json(safeUser);
    } catch (error) {
      console.error("Error updating user admin status:", error);
      res.status(500).json({ message: "Failed to update user" });
    }
  });

  app.put('/api/admin/users/:id/active', requireAdmin, async (req: any, res) => {
    try {
      const { id } = req.params;
      const { isActive } = req.body;
      const user = await storage.updateUserActiveStatus(id, isActive);
      const { password, ...safeUser } = user;
      res.json(safeUser);
    } catch (error) {
      console.error("Error updating user status:", error);
      res.status(500).json({ message: "Failed to update user" });
    }
  });

  // Plant identification endpoint
  app.post("/api/identify", requireAuth, upload.array('images', 3), async (req: any, res) => {
    try {
      const userId = req.user.id;
      const files = req.files as Express.Multer.File[];
      
      if (!files || files.length === 0) {
        return res.status(400).json({ message: "No images provided" });
      }

      // Get user for language preference
      const user = await storage.getUser(userId);
      const preferredLanguage = user?.preferredLanguage || 'en';

      // Check subscription and free tier limits
      const subscription = await storage.getUserSubscription(userId);
      const isSubscribed = subscription && subscription.status === 'active';
      let isUsingFreeTier = false;

      if (!isSubscribed) {
        // Check free tier eligibility
        const freeTierStatus = await storage.checkFreeTierEligibility(userId);
        
        if (!freeTierStatus.eligible) {
          return res.status(402).json({ 
            message: freeTierStatus.remainingUses === 0 && freeTierStatus.daysLeft > 0 
              ? `Free tier limit reached (3 identifications). Please upgrade to Pro for unlimited access or wait ${freeTierStatus.daysLeft} days for reset.`
              : "Free tier expired. Please upgrade to Pro for unlimited plant identifications.",
            freeTierStatus
          });
        }
        
        isUsingFreeTier = true;
      }

      // Convert files to base64 for API calls
      const images = files.map(file => ({
        data: file.buffer.toString('base64'),
        mimeType: file.mimetype,
      }));

      // Step 1: Quality assessment with OpenAI
      const qualityCheck = await openaiService.generateStructuredContent(`
        Assess image quality for plant identification:
        ${images.length} images provided.
        Return JSON with: {"suitable": boolean, "suggestions": [array of suggestions if not suitable]}
      `);
      if (!(qualityCheck as any).suitable) {
        return res.status(400).json({ 
          message: "Image quality insufficient for identification",
          suggestions: (qualityCheck as any).suggestions 
        });
      }

      // Step 2: Plant identification with Plant.id
      const { plantIdService } = await import("./services/plantId");
      const identification = await plantIdService.identifyPlant(images);
      if (!identification.species || identification.confidence < 0.1) {
        return res.status(400).json({ 
          message: "Unable to identify plant from the provided images" 
        });
      }

      // Step 2.5: Enhance species information with localized names
      const enrichedSpecies = await plantNamesService.enrichPlantSpecies(
        identification.species, 
        preferredLanguage
      );

      // Step 3: Get catalog information
      const catalogInfo = await plantsCatalogService.getPlantInfo(identification.species.scientificName);

      // Step 4: Generate care plan
      const carePlan = await carePlannerService.generateCarePlan({
        identification: { ...identification, species: enrichedSpecies },
        catalogInfo,
      });

      // Step 5: Check for diseases
      const healthAssessment = await plantIdService.assessPlantHealth(images);
      let diseaseAdvice = null;
      if (healthAssessment.diseases && healthAssessment.diseases.length > 0) {
        diseaseAdvice = await openaiService.generateStructuredContent(`
          Provide disease advice for these plant diseases:
          ${JSON.stringify(healthAssessment.diseases)}
        `);
      }

      // Step 6: Save to database and update usage tracking
      if (isUsingFreeTier) {
        await storage.incrementFreeTierUsage(userId);
      }

      const plantResult = await storage.createPlantResult({
        userId,
        imageUrls: files.map(file => file.originalname),
        species: enrichedSpecies.scientificName || enrichedSpecies,
        commonName: enrichedSpecies.commonName || '',
        confidence: identification.confidence.toString(),
        analysisData: carePlan,
        healthAssessment: healthAssessment,
        diseaseInfo: diseaseAdvice as any,
        isFreeIdentification: isUsingFreeTier,
        localizedSpecies: enrichedSpecies,
      });

      // Get updated free tier status for response
      let freeTierStatus = null;
      if (isUsingFreeTier) {
        freeTierStatus = await storage.checkFreeTierEligibility(userId);
      }

      // Images are automatically cleaned from memory after processing
      res.json({
        id: plantResult.id,
        species: enrichedSpecies,
        confidence: identification.confidence,
        carePlan,
        diseases: diseaseAdvice,
        createdAt: plantResult.createdAt,
        freeTierStatus,
        message: "Analysis complete. Images automatically cleaned from memory."
      });

    } catch (error) {
      console.error("Error in plant identification:", error);
      res.status(500).json({ message: "Failed to identify plant" });
    }
  });

  // Generate PDF report
  app.post("/api/generate-pdf", requireAuth, async (req: any, res) => {
    try {
      const { resultId } = req.body;
      const userId = req.user.id;

      const result = await storage.getPlantResult(resultId);
      if (!result || result.userId !== userId) {
        return res.status(404).json({ message: "Plant result not found" });
      }

      // Check subscription for PDF access
      const subscription = await storage.getUserSubscription(userId);
      if (!subscription || subscription.status !== 'active') {
        return res.status(402).json({ 
          message: "PDF reports require a Pro subscription" 
        });
      }

      const pdfBuffer = await pdfService.generatePlantReport(result);

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="plant-report-${result.id}.pdf"`);
      res.send(pdfBuffer);

    } catch (error) {
      console.error("Error generating PDF:", error);
      res.status(500).json({ message: "Failed to generate PDF" });
    }
  });

  // Multi-currency pricing API
  app.get("/api/pricing", async (req, res) => {
    try {
      const { currency = 'USD', location } = req.query;
      
      // Auto-detect currency based on location if provided
      const detectedCurrency = location 
        ? pricingService.detectCurrencyByLocation(location as string)
        : currency as string;
      
      const pricingArray = pricingService.getAllPlanPricing(detectedCurrency);
      const supportedCurrencies = pricingService.getSupportedCurrencies();
      
      console.log('🔧 Pricing API Debug:', {
        requestedCurrency: currency,
        detectedCurrency,
        pricingArrayLength: pricingArray.length,
        pricingArraySample: pricingArray[0],
        supportedCurrenciesLength: supportedCurrencies.length
      });
      
      // Convert plans array to object format expected by frontend
      const plansObject = pricingArray.reduce((acc, plan) => {
        acc[plan.planId] = {
          planId: plan.planId,
          amount: plan.amount,
          formattedPrice: new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: detectedCurrency,
            minimumFractionDigits: 0,
            maximumFractionDigits: 2,
          }).format(plan.amount),
          supportedProviders: plan.supportedProviders
        };
        return acc;
      }, {} as Record<string, any>);
      
      console.log('🔧 Final Response:', {
        currency: detectedCurrency,
        plansObject,
        supportedCurrencies: supportedCurrencies.slice(0, 5) + '...'
      });
      
      res.json({
        currency: detectedCurrency,
        plans: plansObject,
        supportedCurrencies,
      });
    } catch (error) {
      console.error("Error fetching pricing:", error);
      res.status(500).json({ message: "Failed to fetch pricing" });
    }
  });

  // Payment endpoints with multi-currency support
  app.post("/api/checkout", requireAuth, async (req: any, res) => {
    try {
      const { planId, currency = 'USD', provider } = req.body;
      const userId = req.user.id;
      const user = await storage.getUser(userId);

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Get pricing for the requested currency
      const pricing = pricingService.getPlanPricing(planId, currency);
      if (!pricing) {
        return res.status(400).json({ message: "Invalid plan or unsupported currency" });
      }

      // Auto-select provider if not specified
      const selectedProvider = provider || pricingService.getOptimalProvider(currency, user.location || undefined);
      
      // Verify provider supports the currency
      if (!pricing.supportedProviders.includes(selectedProvider)) {
        return res.status(400).json({ 
          message: `Payment provider ${selectedProvider} does not support ${currency}`,
          supportedProviders: pricing.supportedProviders
        });
      }

      const checkoutUrl = await paymentService.createCheckout(selectedProvider, {
        userId,
        userEmail: user.email || '',
        planId,
        currency,
        amount: pricing.amount,
      });

      res.json({ 
        checkoutUrl, 
        currency, 
        amount: pricing.amount,
        provider: selectedProvider,
        formattedPrice: pricingService.formatPrice(pricing.amount, currency)
      });

    } catch (error) {
      console.error("Error creating checkout:", error);
      res.status(500).json({ message: "Failed to create checkout session" });
    }
  });

  // Payment webhooks
  // Create payment intent for consultation
  app.post("/api/create-consultation-payment-intent", requireAuth, async (req: any, res) => {
    try {
      const { consultationId, amount, currency = 'USD' } = req.body;
      
      // Verify consultation exists and belongs to user
      const consultation = await storage.getConsultationRequest(consultationId);
      if (!consultation) {
        return res.status(404).json({ 
          success: false, 
          message: "Consultation not found" 
        });
      }

      if (consultation.userId !== req.user.id && !req.user.isAdmin) {
        return res.status(403).json({ 
          success: false, 
          message: "Access denied" 
        });
      }

      // Create payment checkout URL using payment service
      const checkoutUrl = await paymentService.createCheckout('stripe', {
        userId: req.user.id,
        userEmail: req.user.email || '',
        planId: 'consultation',
        currency,
        amount: amount,
      });

      // Update consultation with payment intent ID
      await storage.updateConsultationRequest(consultationId, {
        paymentIntentId: consultationId,
        status: 'payment_pending'
      });

      res.json({ 
        success: true,
        checkoutUrl: checkoutUrl
      });
    } catch (error: any) {
      console.error('Error creating consultation payment intent:', error);
      res.status(500).json({ 
        success: false,
        message: "Error creating payment intent: " + error.message 
      });
    }
  });

  app.post("/api/webhooks/stripe", async (req, res) => {
    try {
      await paymentService.handleWebhook('stripe', req.body, req.headers);
      res.json({ received: true });
    } catch (error) {
      console.error("Stripe webhook error:", error);
      res.status(400).json({ message: "Webhook error" });
    }
  });

  app.post("/api/webhooks/razorpay", async (req, res) => {
    try {
      await paymentService.handleWebhook('razorpay', req.body, req.headers);
      res.json({ received: true });
    } catch (error) {
      console.error("Razorpay webhook error:", error);
      res.status(400).json({ message: "Webhook error" });
    }
  });

  app.post("/api/webhooks/cashfree", async (req, res) => {
    try {
      await paymentService.handleWebhook('cashfree', req.body, req.headers);
      res.json({ received: true });
    } catch (error) {
      console.error("Cashfree webhook error:", error);
      res.status(400).json({ message: "Webhook error" });
    }
  });

  // Plant results endpoints
  app.get("/api/results/:id", requireAuth, async (req: any, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      const result = await storage.getPlantResult(id);
      if (!result || result.userId !== userId) {
        return res.status(404).json({ message: "Plant result not found" });
      }

      res.json(result);
    } catch (error) {
      console.error("Error fetching plant result:", error);
      res.status(500).json({ message: "Failed to fetch plant result" });
    }
  });

  app.get("/api/my-garden", requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const results = await storage.getUserPlantResults(userId);
      res.json(results);
    } catch (error) {
      console.error("Error fetching user plants:", error);
      res.status(500).json({ message: "Failed to fetch plants" });
    }
  });

  // Blog endpoints
  app.get("/api/blog", async (req, res) => {
    try {
      const posts = await storage.getBlogPosts(true);
      res.json(posts);
    } catch (error) {
      console.error("Error fetching blog posts:", error);
      res.status(500).json({ message: "Failed to fetch blog posts" });
    }
  });

  app.get("/api/blog/:slug", async (req, res) => {
    try {
      const { slug } = req.params;
      const post = await storage.getBlogPost(slug);
      
      if (!post || !post.published) {
        return res.status(404).json({ message: "Blog post not found" });
      }

      res.json(post);
    } catch (error) {
      console.error("Error fetching blog post:", error);
      res.status(500).json({ message: "Failed to fetch blog post" });
    }
  });

  // Admin blog endpoints (basic implementation)
  app.post("/api/admin/blog", requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const data = insertBlogPostSchema.parse({ ...req.body, authorId: userId });
      
      const post = await storage.createBlogPost(data);
      res.json(post);
    } catch (error) {
      console.error("Error creating blog post:", error);
      res.status(500).json({ message: "Failed to create blog post" });
    }
  });

  // Subscription status endpoint
  app.get("/api/subscription", requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.id;
      
      // Handle database schema issues gracefully
      try {
        const subscription = await storage.getUserSubscription(userId);
        
        if (!subscription) {
          return res.json({ status: 'none', planName: 'Free Plan' });
        }

        res.json(subscription);
      } catch (dbError: any) {
        // If database schema issue, return default subscription info
        if (dbError.code === '42703') { // Column does not exist
          console.warn("Subscription table schema issue, returning default:", dbError.message);
          return res.json({ status: 'none', planName: 'Free Plan' });
        }
        throw dbError; // Re-throw other errors
      }
    } catch (error) {
      console.error("Error fetching subscription:", error);
      // Return default instead of 500 error to prevent logout loops
      res.json({ status: 'none', planName: 'Free Plan' });
    }
  });

  // Free tier status endpoint
  app.get("/api/free-tier-status", requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const freeTierStatus = await storage.checkFreeTierEligibility(userId);
      res.json(freeTierStatus);
    } catch (error) {
      console.error("Error fetching free tier status:", error);
      res.status(500).json({ message: "Failed to fetch free tier status" });
    }
  });

  // Language preferences endpoint
  app.get("/api/languages", async (req, res) => {
    try {
      const supportedLanguages = plantNamesService.getSupportedLanguages();
      res.json(supportedLanguages);
    } catch (error) {
      console.error("Error fetching supported languages:", error);
      res.status(500).json({ message: "Failed to fetch supported languages" });
    }
  });

  app.put("/api/user/language", requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const { language } = req.body;
      
      if (!language) {
        return res.status(400).json({ message: "Language code is required" });
      }

      const user = await storage.updateUser(userId, { preferredLanguage: language });
      res.json({ message: "Language preference updated", language: user.preferredLanguage });
    } catch (error) {
      console.error("Error updating language preference:", error);
      res.status(500).json({ message: "Failed to update language preference" });
    }
  });

  // Plant care tips endpoint
  app.get("/api/care-tips/:speciesId", async (req, res) => {
    try {
      const { speciesId } = req.params;
      const result = await storage.getPlantResult(speciesId);
      
      if (!result) {
        return res.status(404).json({ message: "Plant not found" });
      }

      // Extract care tips from the care plan
      const carePlan = result.analysisData as any;
      const careTips = {
        watering: carePlan?.watering || {},
        lighting: carePlan?.lighting || {},
        soil: carePlan?.soil || {},
        temperature: carePlan?.temperature || {},
        humidity: carePlan?.humidity || {},
        fertilizing: carePlan?.fertilizing || {},
        seasonal: carePlan?.seasonal || {},
      };

      res.json(careTips);
    } catch (error) {
      console.error("Error fetching care tips:", error);
      res.status(500).json({ message: "Failed to fetch care tips" });
    }
  });

  // Plant health monitoring endpoint
  app.post("/api/health-check/:plantId", requireAuth, upload.array('images', 3), async (req: any, res) => {
    try {
      const userId = req.user.id;
      const { plantId } = req.params;
      const files = req.files as Express.Multer.File[];
      
      if (!files || files.length === 0) {
        return res.status(400).json({ message: "No images provided" });
      }

      // Verify plant ownership
      const plant = await storage.getPlantResult(plantId);
      if (!plant || plant.userId !== userId) {
        return res.status(404).json({ message: "Plant not found" });
      }

      // Convert files to base64 for API calls
      const images = files.map(file => ({
        data: file.buffer.toString('base64'),
        mimeType: file.mimetype,
      }));

      // Assess plant health
      const { plantIdService } = await import("./services/plantId");
      const healthAssessment = await plantIdService.assessPlantHealth(images);
      
      let advice = null;
      if (healthAssessment.diseases && healthAssessment.diseases.length > 0) {
        advice = await openaiService.generateStructuredContent(`
          Provide disease advice for these plant diseases:
          ${JSON.stringify(healthAssessment.diseases)}
        `);
      }

      res.json({
        plantId,
        isHealthy: healthAssessment.isHealthy,
        diseases: healthAssessment.diseases,
        advice,
        checkedAt: new Date(),
      });

    } catch (error) {
      console.error("Error in health check:", error);
      res.status(500).json({ message: "Failed to check plant health" });
    }
  });

  // Reviews endpoints
  app.get("/api/reviews", async (req, res) => {
    try {
      const reviews = await storage.getReviews(true); // Only published reviews
      res.json(reviews);
    } catch (error) {
      console.error("Error fetching reviews:", error);
      res.status(500).json({ message: "Failed to fetch reviews" });
    }
  });

  app.post("/api/reviews", requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const reviewData = insertReviewSchema.parse({ ...req.body, userId });
      
      const review = await storage.createReview(reviewData);
      res.json(review);
    } catch (error) {
      console.error("Error creating review:", error);
      if (error instanceof Error && error.name === 'ZodError') {
        return res.status(400).json({ message: "Invalid review data" });
      }
      res.status(500).json({ message: "Failed to create review" });
    }
  });

  // Social Media Management API Routes
  app.get("/api/admin/social-settings", requireAdmin, async (req, res) => {
    try {
      const settings = await socialMediaService.getSettings();
      res.json(settings);
    } catch (error) {
      console.error("Error fetching social media settings:", error);
      res.status(500).json({ message: "Failed to fetch settings" });
    }
  });

  app.put("/api/admin/social-settings", requireAdmin, async (req, res) => {
    try {
      const settings = await socialMediaService.updateSettings(req.body);
      res.json(settings);
    } catch (error) {
      console.error("Error updating social media settings:", error);
      res.status(500).json({ message: "Failed to update settings" });
    }
  });

  app.get("/api/admin/social-posts", requireAdmin, async (req, res) => {
    try {
      const posts = await socialMediaService.getPosts();
      res.json(posts);
    } catch (error) {
      console.error("Error fetching social media posts:", error);
      res.status(500).json({ message: "Failed to fetch posts" });
    }
  });

  app.post("/api/admin/social-posts", requireAdmin, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const post = await socialMediaService.createPost(req.body, userId);
      res.json(post);
    } catch (error) {
      console.error("Error creating social media post:", error);
      res.status(500).json({ message: "Failed to create post" });
    }
  });

  app.post("/api/admin/social-posts/:id/publish", requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const result = await socialMediaService.publishPost(id);
      res.json(result);
    } catch (error: any) {
      console.error("Error publishing social media post:", error);
      res.status(500).json({ message: "Failed to publish post: " + error.message });
    }
  });

  app.get("/api/admin/social-analytics", requireAdmin, async (req, res) => {
    try {
      const analytics = await socialMediaService.getAnalytics();
      res.json(analytics);
    } catch (error) {
      console.error("Error fetching social media analytics:", error);
      res.status(500).json({ message: "Failed to fetch analytics" });
    }
  });

  // Admin banner image endpoint
  // Admin banner settings endpoints
  app.get("/api/admin/banner-settings", async (req, res) => {
    try {
      const [imageUrl, heading, subheading] = await Promise.all([
        storage.getAdminSetting('banner_image_url'),
        storage.getAdminSetting('banner_heading'),
        storage.getAdminSetting('banner_subheading')
      ]);
      
      res.json({ 
        imageUrl: imageUrl?.settingValue || null,
        heading: heading?.settingValue || "Accurately Identify Your Plant With Our GreenLens-Powered AI System",
        subheading: subheading?.settingValue || "Upload a plant photo and get Instant Plant Identification"
      });
    } catch (error) {
      console.error("Error fetching banner settings:", error);
      res.status(500).json({ message: "Failed to fetch banner settings" });
    }
  });

  app.post("/api/admin/banner-settings", requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const { imageUrl, heading, subheading } = req.body;
      
      const updates = [];
      
      if (imageUrl !== undefined) {
        updates.push(storage.setAdminSetting({
          settingKey: 'banner_image_url',
          settingValue: imageUrl,
          description: 'URL for the main banner background image',
          lastUpdatedBy: userId,
        }));
      }
      
      if (heading !== undefined) {
        updates.push(storage.setAdminSetting({
          settingKey: 'banner_heading',
          settingValue: heading,
          description: 'Main heading text for the banner',
          lastUpdatedBy: userId,
        }));
      }
      
      if (subheading !== undefined) {
        updates.push(storage.setAdminSetting({
          settingKey: 'banner_subheading',
          settingValue: subheading,
          description: 'Subheading text for the banner',
          lastUpdatedBy: userId,
        }));
      }

      await Promise.all(updates);

      res.json({ 
        imageUrl: imageUrl || null,
        heading: heading || null,
        subheading: subheading || null
      });
    } catch (error) {
      console.error("Error updating banner settings:", error);
      res.status(500).json({ message: "Failed to update banner settings" });
    }
  });

  // Feature control settings endpoints
  app.get("/api/admin/feature-settings", async (req, res) => {
    try {
      const [gardeningShop, ebookMarketplace, blog, consultation] = await Promise.all([
        storage.getPlatformSetting('gardeningShopEnabled'),
        storage.getPlatformSetting('ebookMarketplaceEnabled'),
        storage.getPlatformSetting('blogEnabled'),
        storage.getPlatformSetting('consultationEnabled')
      ]);
      
      res.json({
        gardeningShopEnabled: gardeningShop?.settingValue === 'true',
        ebookMarketplaceEnabled: ebookMarketplace?.settingValue === 'true',
        blogEnabled: blog?.settingValue === 'true',
        consultationEnabled: consultation?.settingValue === 'true',
      });
    } catch (error) {
      console.error("Error fetching feature settings:", error);
      res.status(500).json({ message: "Failed to fetch feature settings" });
    }
  });

  app.post("/api/admin/feature-settings", requireAdmin, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const { gardeningShopEnabled, ebookMarketplaceEnabled, blogEnabled, consultationEnabled } = req.body;
      
      const updates = [];
      
      if (gardeningShopEnabled !== undefined) {
        updates.push(storage.setPlatformSetting({
          settingKey: 'gardeningShopEnabled',
          settingValue: gardeningShopEnabled.toString(),
          settingType: 'boolean',
          description: 'Enable/disable the gardening shop feature',
          category: 'general',
          updatedBy: userId,
        }));
      }
      
      if (ebookMarketplaceEnabled !== undefined) {
        updates.push(storage.setPlatformSetting({
          settingKey: 'ebookMarketplaceEnabled',
          settingValue: ebookMarketplaceEnabled.toString(),
          settingType: 'boolean',
          description: 'Enable/disable the e-book marketplace feature',
          category: 'ebook',
          updatedBy: userId,
        }));
      }

      if (blogEnabled !== undefined) {
        updates.push(storage.setPlatformSetting({
          settingKey: 'blogEnabled',
          settingValue: blogEnabled.toString(),
          settingType: 'boolean',
          description: 'Enable/disable the blog feature',
          category: 'general',
          updatedBy: userId,
        }));
      }

      if (consultationEnabled !== undefined) {
        updates.push(storage.setPlatformSetting({
          settingKey: 'consultationEnabled',
          settingValue: consultationEnabled.toString(),
          settingType: 'boolean',
          description: 'Enable/disable the consultation feature',
          category: 'general',
          updatedBy: userId,
        }));
      }

      await Promise.all(updates);

      res.json({ 
        gardeningShopEnabled: gardeningShopEnabled,
        ebookMarketplaceEnabled: ebookMarketplaceEnabled,
        blogEnabled: blogEnabled,
        consultationEnabled: consultationEnabled,
      });
    } catch (error) {
      console.error("Error updating feature settings:", error);
      res.status(500).json({ message: "Failed to update feature settings" });
    }
  });

  app.post("/api/admin/feature-settings", requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const { settingKey, settingValue, settingType, category, description } = req.body;
      
      // Try to update existing setting first
      const existingSetting = await storage.getPlatformSetting(settingKey);
      
      if (existingSetting) {
        await storage.updatePlatformSetting(settingKey, settingValue);
      } else {
        await storage.createPlatformSetting({
          settingKey,
          settingValue,
          settingType,
          category,
          description,
          updatedBy: userId,
        });
      }

      res.json({ 
        success: true,
        settingKey,
        settingValue,
      });
    } catch (error) {
      console.error("Error updating feature settings:", error);
      res.status(500).json({ message: "Failed to update feature settings" });
    }
  });

  // Gardening content routes
  app.get('/api/admin/gardening-content', async (req, res) => {
    try {
      const content = await storage.getGardeningContent();
      if (!content) {
        // Return default content if none exists
        res.json({
          sectionTitle: "All you need to know about the Right Gardening Tools",
          sectionDescription: "Master the essential tools and techniques that make gardening easier and more productive. Learn proper usage, maintenance, and selection of quality gardening equipment.",
          tools: [
            {
              id: "1",
              name: "Garden Spade",
              description: "A garden spade is the cornerstone of any gardener's toolkit and represents one of the most essential investments for serious gardening. This precision-engineered tool features a sharp, flat blade designed for cutting through tough soil, creating clean edges, and transplanting plants with minimal root disturbance. The long wooden or fiberglass handle provides excellent leverage for digging deeper holes with significantly less effort, while the stepped blade (also called a footrest) allows for safe foot pressure without damaging your shoes or losing control. Quality spades are forged from high-carbon steel for durability and maintain their sharp edge longer than cheaper alternatives. The blade's flat design makes it superior to shovels for precision work, as it cuts cleanly through soil and roots rather than scooping. A well-maintained spade will last decades and improve with age as the handle develops a comfortable patina from use.",
              category: "Digging Tools",
              imageUrl: "https://cdn.pixabay.com/photo/2013/03/02/02/41/city-89197_1280.jpg",
              usageTips: "Position the blade vertically against the soil and use your foot to push down on the step (shoulder of the blade) - never use your hands to push down on the handle as this can cause injury. Keep your back straight and use your legs for power, bending at the knees rather than the waist. For transplanting, dig around the plant in a complete circle first, maintaining the same depth, then angle the spade under the root ball at a 45-degree angle. When digging holes, work in a grid pattern to maintain consistent depth. Clean the blade after each use with a wire brush to remove soil buildup, and oil the metal occasionally to prevent rust. Store in a dry place, preferably hanging to avoid dulling the edge. Sharpen the blade annually with a file, maintaining the original bevel angle. Choose a spade with a comfortable D-grip handle and blade width appropriate for your strength - typically 7-8 inches for most gardeners.",
              bestFor: ["Digging precise planting holes", "Transplanting shrubs and perennials", "Cutting through tough compacted soil", "Creating clean garden bed edges", "Breaking up hardpan soil"],
              isRecommended: true
            },
            {
              id: "2", 
              name: "Pruning Shears",
              description: "High-quality bypass pruning shears are absolutely essential for maintaining plant health and promoting vigorous growth throughout your garden. These precision instruments feature two sharp, curved blades that work like scissors - one blade cuts while the other supports, creating clean cuts that heal quickly and prevent disease entry points. Professional-grade shears are constructed with high-carbon steel blades that hold their edge longer and resist corrosion. The ergonomic design reduces hand fatigue during extended pruning sessions, while the safety lock mechanism ensures secure storage and prevents accidental cuts. Quality shears will have replaceable parts, allowing you to maintain them for years rather than replacing them. The bypass design is superior to anvil-type pruners for living wood, as it doesn't crush the plant tissue. Proper pruning shears are an investment in your garden's health - clean cuts promote faster healing, reduce disease transmission, and encourage proper growth patterns.",
              category: "Cutting Tools",
              imageUrl: "https://cdn.pixabay.com/photo/2016/09/07/11/37/tropical-1651426_1280.jpg",
              usageTips: "Make clean cuts at 45-degree angles just above growth nodes or buds, sloping away from the bud to direct water runoff. Always position the cutting blade closest to the main plant and the hook blade on the waste side - this ensures the cleanest possible cut on the remaining plant. Clean blades with 70% isopropyl alcohol between plants to prevent disease transmission, especially when dealing with diseased material. Cut branches no thicker than your thumb - use loppers for larger branches to avoid damaging the shears. Open the shears fully before cutting to engage the proper cutting action. Keep blades sharp with regular sharpening using a sharpening stone or file, maintaining the original blade angle. Oil the pivot point monthly and tighten the bolt as needed. Store with the safety lock engaged in a dry location. Quality shears can be disassembled for thorough cleaning and blade replacement when needed.",
              bestFor: ["Deadheading spent flowers", "Trimming small branches and stems", "Harvesting fruits and vegetables", "Shaping and training plants", "Removing diseased or damaged growth"]
            },
            {
              id: "3",
              name: "Watering Can",
              description: "A traditional watering can provides precise water control and gentle application that's absolutely perfect for delicate plants, seedlings, and container gardens. This timeless tool offers advantages that modern hoses and sprinkler systems simply cannot match - complete control over water pressure, temperature, and placement. The removable rose (spout head) allows for different watering patterns, from a gentle shower that mimics natural rainfall for sensitive plants to a focused stream for deep watering of established specimens. Quality watering cans are balanced when full, with the weight distributed between the main handle and the spout handle, making them comfortable to carry and pour even when loaded with several gallons of water. The long spout allows you to reach hanging baskets and back corners of garden beds without trampling other plants. Many experienced gardeners prefer watering cans for their precision and the meditative quality of hand-watering, which allows for close inspection of plants during the watering process.",
              category: "Watering Tools",
              imageUrl: "https://cdn.pixabay.com/photo/2017/05/23/22/33/watering-can-2339722_1280.jpg",
              usageTips: "Water during early morning hours (6-8 AM) or evening (6-8 PM) to minimize evaporation and reduce shock to plants during hot weather. Remove the rose attachment for a gentle shower effect perfect for seedlings and young plants, or keep it attached for a more controlled flow. Always water at soil level rather than over foliage to prevent fungal diseases and maximize water uptake. Fill the can completely for better weight distribution and balance - a half-full can is actually harder to control. Hold the can close to plants to minimize splash and water waste, and pour slowly to allow water to penetrate rather than run off. When watering containers, pour until water runs from drainage holes, then stop. For seedlings, use lukewarm water rather than cold to avoid shocking tender roots. Clean the can regularly, especially the rose attachment, to prevent clogging from mineral deposits. Store indoors during freezing weather to prevent cracking.",
              bestFor: ["Caring for delicate seedlings", "Watering container and potted plants", "Applying liquid fertilizers", "Precise watering in tight spaces", "Indoor plant care"]
            },
            {
              id: "4",
              name: "Hand Cultivator",
              description: "This essential three-pronged hand tool is designed for precise soil cultivation around established plants and represents the perfect marriage of functionality and finesse in garden maintenance. The sharp, curved tines easily penetrate compacted soil to improve aeration and water infiltration while being gentle enough not to disturb shallow root systems. This indispensable tool excels in tight spaces where larger implements would cause damage to nearby vegetation or established root zones. The ergonomic handle reduces hand strain during extended use, while the forged steel tines maintain their shape and sharpness season after season. Professional gardeners rely on hand cultivators for detailed work that requires precision and care. The three-tine design provides optimal soil penetration without excessive soil disturbance, making it ideal for working around perennials, in rock gardens, and between closely spaced plants. Regular use of a hand cultivator prevents soil compaction, improves water absorption, and creates the perfect environment for beneficial soil organisms to thrive.",
              category: "Soil Tools",
              imageUrl: "https://cdn.pixabay.com/photo/2016/04/15/04/02/garden-1330640_1280.jpg",
              usageTips: "Use gentle scratching motions, working the tines 2-3 inches deep around plant roots while being careful not to damage feeder roots near the surface. Work when soil is slightly moist - avoid working wet (muddy) soil which can compact, and bone-dry soil which is too hard to penetrate effectively. Clean tines after each use with a wire brush to prevent soil buildup and rust formation. Work in circular motions around plants, maintaining at least 6 inches from the main stem to avoid root damage. The tool is perfect for breaking up surface crusts that form after heavy rains and prevent proper water penetration. Apply light pressure and let the tool do the work - forcing it can damage both the tool and plant roots. Store in a dry place and oil the metal components annually to prevent rust.",
              bestFor: ["Removing small weeds by the roots", "Aerating compacted soil around plants", "Surface cultivation without disturbing roots", "Mixing compost into existing soil", "Breaking up surface crusts"]
            },
            {
              id: "5",
              name: "Garden Rake",
              description: "A versatile garden rake is absolutely indispensable for creating smooth, level planting surfaces and maintaining overall garden tidiness throughout the growing season. This fundamental tool features sturdy steel tines that effectively break up soil clods, remove unwanted debris, and create the perfect fine-textured seedbed that small seeds require for optimal germination. The long hardwood handle provides excellent leverage and reach, significantly reducing back strain during extended use while allowing you to cover large areas efficiently. Quality garden rakes are built to last for decades, with replaceable handles and durable steel heads that can be sharpened when needed. The spacing and curve of the tines are precisely designed to gather leaves and debris while allowing soil to fall through, making cleanup tasks much more efficient. Beyond basic maintenance, garden rakes are essential for preparing planting areas, incorporating amendments into soil, and creating the smooth, even surfaces that professional landscapers demand. The tool's versatility makes it valuable for both spring preparation and fall cleanup tasks.",
              category: "Soil Tools",
              imageUrl: "https://cdn.pixabay.com/photo/2016/11/21/15/28/agriculture-1846044_1280.jpg",
              usageTips: "Pull the rake towards you with long, smooth strokes to level soil and gather debris efficiently - avoid short, choppy movements that create uneven surfaces. Use the back (flat) side of the rake head to break up large soil clods and create smooth, even surfaces perfect for seeding. Work systematically across garden beds in overlapping passes, similar to mowing a lawn, to ensure complete coverage. Keep tines clean of debris during use for maximum effectiveness - stop periodically to clear accumulated material. When leveling soil, work when it's at proper moisture content - not too wet (muddy) or too dry (dusty). Store the rake hanging vertically to prevent tine damage and maintain proper alignment. Replace the handle when it becomes loose or cracked, as a secure connection is essential for effective use.",
              bestFor: ["Creating smooth planting surfaces", "Removing leaves and garden debris", "Breaking up compacted soil clods", "Preparing seedbeds for fine seeds", "Spreading and leveling mulch"]
            },
            {
              id: "6",
              name: "Garden Hose with Nozzle",
              description: "A quality garden hose with adjustable nozzle forms the absolute backbone of efficient garden watering systems and represents one of the most important investments in garden infrastructure. Modern high-quality hoses are engineered to resist kinking, UV degradation, and temperature extremes while maintaining flexibility throughout their lifespan. The multi-pattern nozzle attachment transforms this simple tool into a precision watering instrument, providing everything from gentle mist perfect for delicate seedlings to powerful jet streams for cleaning tasks and stubborn soil removal. Professional-grade hoses feature reinforced construction with multiple layers - an inner tube for water flow, reinforcement mesh for strength, and an outer jacket for protection against abrasion and weather damage. The ideal hose length should reach all garden areas without excess coiling, which can reduce water pressure and create storage challenges. Quality hoses will maintain consistent water flow and pressure across their entire length, ensuring effective watering even at maximum extension. The combination of a well-designed hose and precision nozzle creates a watering system that rivals more expensive automated solutions while providing the flexibility and control that only hand-watering can offer.",
              category: "Watering Tools",
              imageUrl: "https://cdn.pixabay.com/photo/2015/12/07/10/21/garden-hose-1080536_1280.jpg",
              usageTips: "Use soaker or shower setting for deep, gentle watering of established plants, allowing water to penetrate deeply rather than running off the surface. Mist setting works best for seedlings, delicate foliage, and newly transplanted specimens that need gentle moisture without soil displacement. Jet setting is perfect for cleaning garden tools, washing down walkways, and removing stubborn debris from plant leaves. Always drain the hose completely in winter to prevent freeze damage that can cause splitting and permanent damage. Store coiled properly or on a hose reel to prevent kinking, which reduces water flow and can cause weak spots. Check all connections regularly for leaks and replace washers as needed to maintain proper pressure. When watering, move the hose gently to avoid damaging plants, and use a soaker setting for extended watering sessions to prevent water waste and ensure deep soil penetration.",
              bestFor: ["Watering large garden areas efficiently", "Cleaning garden tools and equipment", "Filling watering cans and containers", "Washing down garden paths and patios", "Emergency watering during dry spells"],
              isRecommended: true
            },
            {
              id: "7",
              name: "Garden Gloves",
              description: "Quality garden gloves represent essential protection for hands during all gardening activities and are absolutely fundamental to safe, comfortable garden work. Professional-grade gloves feature reinforced palms and fingertips to prevent wear-through in high-stress areas, while maintaining breathable materials that prevent excessive sweating and discomfort during extended use. The proper fit is crucial - gloves should be snug enough to maintain dexterity but not so tight as to restrict circulation or cause hand fatigue. Different glove thicknesses and materials serve specific purposes: thin nitrile-coated gloves provide excellent grip and sensitivity for delicate transplanting work, thick leather gloves offer maximum protection when dealing with thorny roses and brambles, and waterproof versions keep hands dry during wet conditions while maintaining flexibility. Quality gloves are an investment in hand health and gardening enjoyment - they prevent cuts, scratches, and chemical exposure while reducing hand fatigue and improving grip on tools. Many experienced gardeners maintain several pairs of gloves for different tasks, understanding that the right gloves can transform difficult or uncomfortable garden work into pleasant, efficient activities.",
              category: "Protection",
              imageUrl: "https://cdn.pixabay.com/photo/2017/08/25/15/10/gloves-2680964_1280.jpg",
              usageTips: "Choose appropriate thickness and material for your specific task - thin nitrile-coated gloves for delicate transplanting and detailed work, thick leather gloves for thorny roses and brambles, and waterproof gloves for wet conditions. Always let gloves dry completely after use to prevent mold growth and unpleasant odors - stuff them with newspaper if necessary to speed drying. Keep multiple pairs for different jobs and wash them regularly according to manufacturer instructions. Replace gloves when worn through or when grip begins to fail, as damaged gloves provide inadequate protection. Store in a dry, well-ventilated area away from direct sunlight which can degrade rubber and synthetic materials. Turn gloves inside out occasionally during drying to ensure complete moisture removal. For chemical applications, choose gloves specifically rated for garden chemical resistance.",
              bestFor: ["Protecting hands during rose and berry pruning", "Handling soil and compost safely", "Applying fertilizers and garden chemicals", "General garden maintenance and weeding", "Protecting against cuts and scrapes"],
              isRecommended: true
            },
            {
              id: "8",
              name: "Wheelbarrow",
              description: "A sturdy wheelbarrow is absolutely indispensable for moving heavy materials around the garden efficiently and represents one of the most important labor-saving devices in any serious gardener's arsenal. Modern professional-grade wheelbarrows feature deep, reinforced steel or poly bins that resist rust and cracking, comfortable ergonomic grips that reduce hand fatigue, and pneumatic tires that roll smoothly over various terrain including grass, gravel, and uneven surfaces. The traditional single-wheel design provides excellent maneuverability in tight spaces between plants, around raised beds, and through garden gates where larger equipment cannot navigate. Quality wheelbarrows are built to handle substantial loads while maintaining balance and control, with reinforced frames that distribute weight effectively. The proper wheelbarrow can transform back-breaking garden tasks into manageable work, whether you're moving soil amendments, transporting plants, collecting debris, or hauling tools to different areas of the garden. Professional landscapers rely on wheelbarrows daily because they combine portability, capacity, and versatility in a single, durable tool that will provide decades of reliable service when properly maintained.",
              category: "Transport",
              imageUrl: "https://cdn.pixabay.com/photo/2018/05/28/22/11/wheelbarrow-3437405_1280.jpg",
              usageTips: "Load weight evenly in the bin and avoid overfilling - a half-full or two-thirds full wheelbarrow is much easier and safer to handle than an overloaded one. Keep the tire properly inflated to the recommended pressure for smooth rolling and to prevent premature wear. Always lift using your legs rather than your back, keeping the load close to your body when lifting the handles. Clean the bin thoroughly after each use to prevent rust formation and soil buildup that can add unnecessary weight. Store under cover or in a shed to extend the life of both metal and plastic components. Balance the load over the wheel rather than in the back of the bin for easier pushing and better control. When navigating slopes, go straight up and down rather than at an angle to maintain stability and prevent tipping.",
              bestFor: ["Transporting soil, compost, and mulch", "Moving large plants and containers", "Collecting and removing garden debris", "Carrying multiple tools to work areas", "Mixing concrete for garden projects"]
            }
          ],
          soilPreparation: [
            {
              id: "1",
              title: "Spring Soil Preparation",
              description: "Get your garden ready for the growing season with proper soil preparation",
              steps: [
                "Test soil pH levels (ideal range: 6.0-7.0)",
                "Remove weeds and debris from planting areas",
                "Add 2-3 inches of compost or organic matter",
                "Till or dig soil to 8-10 inches deep",
                "Level the surface and create planting rows"
              ],
              season: "Spring"
            },
            {
              id: "2",
              title: "Fall Garden Cleanup",
              description: "Prepare your soil for winter and next year's growing season",
              steps: [
                "Remove spent plants and diseased materials",
                "Add fallen leaves as natural mulch",
                "Plant cover crops or green manure",
                "Apply slow-release organic fertilizer",
                "Create winter protection for perennials"
              ],
              season: "Fall"
            }
          ]
        });
      } else {
        res.json(content);
      }
    } catch (error) {
      console.error('Error fetching gardening content:', error);
      res.status(500).json({ message: 'Failed to fetch gardening content' });
    }
  });

  app.post('/api/admin/gardening-content', requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const contentData = { ...req.body, lastUpdatedBy: userId };
      const content = await storage.updateGardeningContent(contentData);
      res.json(content);
    } catch (error) {
      console.error('Error updating gardening content:', error);
      res.status(500).json({ message: 'Failed to update gardening content' });
    }
  });

  // Pricing plans routes
  app.get('/api/pricing-plans', async (req, res) => {
    console.log('🚨 LEGACY ENDPOINT CALLED: /api/pricing-plans - This should not be called for pricing display!');
    try {
      const activeOnly = req.query.activeOnly === 'true';
      const plans = await storage.getPricingPlans(activeOnly);
      console.log('🚨 Returning ARRAY format:', plans.length, 'plans');
      res.json(plans);
    } catch (error) {
      console.error('Error fetching pricing plans:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  app.post('/api/admin/pricing-plans', requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const planData = { ...req.body, lastUpdatedBy: userId };
      const plan = await storage.createPricingPlan(planData);
      res.json(plan);
    } catch (error) {
      console.error('Error creating pricing plan:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  app.put('/api/admin/pricing-plans/:id', requireAuth, async (req: any, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      const updateData = { ...req.body, lastUpdatedBy: userId };
      const plan = await storage.updatePricingPlan(id, updateData);
      res.json(plan);
    } catch (error) {
      console.error('Error updating pricing plan:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  app.delete('/api/admin/pricing-plans/:id', requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const success = await storage.deletePricingPlan(id);
      res.json({ success });
    } catch (error) {
      console.error('Error deleting pricing plan:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  // Legacy banner image endpoint for backward compatibility
  app.get("/api/admin/banner-image", async (req, res) => {
    try {
      const setting = await storage.getAdminSetting('banner_image_url');
      res.json({ imageUrl: setting?.settingValue || null });
    } catch (error) {
      console.error("Error fetching banner image:", error);
      res.status(500).json({ message: "Failed to fetch banner image" });
    }
  });

  app.post("/api/admin/banner-image", requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const { imageUrl } = req.body;
      
      if (!imageUrl) {
        return res.status(400).json({ message: "Image URL is required" });
      }

      const setting = await storage.setAdminSetting({
        settingKey: 'banner_image_url',
        settingValue: imageUrl,
        description: 'URL for the main banner background image',
        lastUpdatedBy: userId,
      });

      res.json({ imageUrl: setting.settingValue });
    } catch (error) {
      console.error("Error updating banner image:", error);
      res.status(500).json({ message: "Failed to update banner image" });
    }
  });

  // Powered by section settings
  app.get("/api/admin/powered-by-settings", async (req, res) => {
    try {
      const [title, description, features] = await Promise.all([
        storage.getAdminSetting('powered_by_title'),
        storage.getAdminSetting('powered_by_description'),
        storage.getAdminSetting('powered_by_features')
      ]);
      
      res.json({
        title: title?.settingValue || "Powered by GreenLens AI Technology",
        description: description?.settingValue || "Experience the future of plant identification with our cutting-edge artificial intelligence system",
        features: features?.settingValue ? JSON.parse(features.settingValue) : [
          "Advanced AI Plant Recognition",
          "99.5% Accuracy Rate", 
          "Real-time Disease Detection",
          "Personalized Care Plans"
        ],
      });
    } catch (error) {
      console.error("Error fetching powered by settings:", error);
      res.status(500).json({ error: "Failed to fetch powered by settings" });
    }
  });

  // Removed duplicate gardening content route - using the first one with hardcoded working image data

  // Plant analysis routes
  app.post("/api/plant-analysis/analyze", requireAuth, upload.array('images', 3), async (req: any, res) => {
    try {
      const userId = req.user.id;
      const files = req.files as Express.Multer.File[];
      
      if (!files || files.length === 0) {
        return res.status(400).json({ error: "No images provided" });
      }

      // Check free tier eligibility
      const eligibility = await storage.checkFreeTierEligibility(userId);
      if (!eligibility.eligible) {
        return res.status(402).json({ 
          error: "Free tier limit reached",
          message: "You have used all 3 free plant identifications. Please upgrade to continue.",
          upgradRequired: true
        });
      }

      // Convert images to base64
      const imageBase64Array = files.map(file => file.buffer.toString('base64'));
      
      // Use PlantAnalysisService to analyze the plant
      const analysisService = new PlantAnalysisService();
      const analysisResult = await analysisService.analyzeImages(imageBase64Array);
      
      // Save analysis result to database
      const plantResult = await storage.createPlantResult({
        userId,
        species: analysisResult.species.scientific,
        commonName: analysisResult.species.common,
        confidence: analysisResult.species.confidence.toString(),
        healthStatus: analysisResult.healthAssessment.isHealthy ? 'healthy' : 'unhealthy',
        diseaseDetected: (analysisResult.healthAssessment.diseases?.length || 0) > 0,
        careInstructions: JSON.stringify(analysisResult.careInstructions),
        analysisData: analysisResult,
        healthAssessment: analysisResult.healthAssessment,
        diseaseInfo: analysisResult.healthAssessment.diseases || [],
        isFreeIdentification: true,
      });

      // Increment free tier usage
      await storage.incrementFreeTierUsage(userId);

      res.json({
        success: true,
        analysisId: plantResult.id,
        ...analysisResult
      });

    } catch (error) {
      console.error("Plant analysis error:", error);
      res.status(500).json({ 
        error: "Analysis failed", 
        message: error instanceof Error ? error.message : "Unknown error" 
      });
    }
  });

  // PDF download route
  app.post("/api/plant-analysis/download-pdf", requireAuth, async (req: any, res) => {
    try {
      const { analysisId } = req.body;
      const userId = req.user.id;
      
      if (!analysisId) {
        return res.status(400).json({ error: "Analysis ID required" });
      }

      // Get the analysis result
      const plantResult = await storage.getPlantResult(analysisId);
      if (!plantResult || plantResult.userId !== userId) {
        return res.status(404).json({ error: "Analysis not found" });
      }

      // Check if user needs to pay for PDF (not for free tier users initially)
      const pdfPricing = await storage.getPricingSetting("PDF_REPORT");
      if (pdfPricing && pdfPricing.isActive && parseFloat(pdfPricing.price) > 0) {
        // For paid PDF reports, check if user has already paid
        const existingPayment = await storage.getUserPayments(userId);
        const pdfPayment = existingPayment.find(p => 
          p.analysisId === analysisId && p.status === 'completed'
        );
        
        if (!pdfPayment) {
          return res.status(402).json({
            error: "Payment required",
            message: `PDF report costs ${pdfPricing.currency} ${pdfPricing.price}`,
            pricing: pdfPricing,
            paymentRequired: true
          });
        }
      }

      // Parse analysis data
      const analysisData = typeof plantResult.analysisData === 'string' 
        ? JSON.parse(plantResult.analysisData) 
        : plantResult.analysisData || {};
      
      // Get user info
      const user = await storage.getUser(userId);
      
      // Generate PDF
      const pdfService = new PDFReportService();
      const pdfBuffer = await pdfService.generatePlantAnalysisReport(
        {
          id: plantResult.id,
          ...analysisData
        },
        { email: user?.email || '' }
      );

      // Set headers for PDF download
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="plant-analysis-${plantResult.id}.pdf"`);
      res.setHeader('Content-Length', pdfBuffer.length);
      
      res.send(pdfBuffer);

    } catch (error) {
      console.error("PDF generation error:", error);
      res.status(500).json({ 
        error: "PDF generation failed", 
        message: error instanceof Error ? error.message : "Unknown error" 
      });
    }
  });

  // Admin pricing management routes
  app.get("/api/admin/pricing-settings", requireAuth, async (req: any, res) => {
    try {
      const settings = await storage.getPricingSettings();
      res.json(settings);
    } catch (error) {
      console.error("Error fetching pricing settings:", error);
      res.status(500).json({ error: "Failed to fetch pricing settings" });
    }
  });

  app.put("/api/admin/pricing-settings/:id", requireAuth, async (req: any, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      const userId = req.user.id;
      
      const updatedSetting = await storage.updatePricingSetting(id, {
        ...updates,
        lastUpdatedBy: userId,
      });
      
      res.json(updatedSetting);
    } catch (error) {
      console.error("Error updating pricing setting:", error);
      res.status(500).json({ error: "Failed to update pricing setting" });
    }
  });

  app.post("/api/admin/pricing-settings", requireAuth, async (req: any, res) => {
    try {
      const settingData = req.body;
      const userId = req.user.id;
      
      const newSetting = await storage.createPricingSetting({
        ...settingData,
        lastUpdatedBy: userId,
      });
      
      res.json(newSetting);
    } catch (error) {
      console.error("Error creating pricing setting:", error);
      res.status(500).json({ error: "Failed to create pricing setting" });
    }
  });

  // Admin pricing management routes
  app.get("/api/admin/pricing", requireAuth, async (req: any, res) => {
    try {
      const pricingSettings = await storage.getAllPricingSettings();
      res.json(pricingSettings);
    } catch (error) {
      console.error("Error fetching pricing settings:", error);
      res.status(500).json({ message: "Failed to fetch pricing settings" });
    }
  });

  app.post("/api/admin/pricing", requireAuth, async (req: any, res) => {
    try {
      const { featureName, price, currency, description, isActive } = req.body;
      
      if (!featureName || !price) {
        return res.status(400).json({ message: "Feature name and price are required" });
      }

      const pricingSetting = await storage.createPricingSetting({
        featureName,
        price,
        currency: currency || 'USD',
        description,
        isActive: isActive !== undefined ? isActive : true,
        lastUpdatedBy: req.user.id,
      });

      res.json(pricingSetting);
    } catch (error) {
      console.error("Error creating pricing setting:", error);
      res.status(500).json({ message: "Failed to create pricing setting" });
    }
  });

  app.put("/api/admin/pricing/:id", requireAuth, async (req: any, res) => {
    try {
      const { id } = req.params;
      const updateData = {
        ...req.body,
        lastUpdatedBy: req.user.id,
      };

      const pricingSetting = await storage.updatePricingSetting(id, updateData);
      
      if (!pricingSetting) {
        return res.status(404).json({ message: "Pricing setting not found" });
      }

      res.json(pricingSetting);
    } catch (error) {
      console.error("Error updating pricing setting:", error);
      res.status(500).json({ message: "Failed to update pricing setting" });
    }
  });

  app.delete("/api/admin/pricing/:id", requireAuth, async (req: any, res) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deletePricingSetting(id);
      
      if (!deleted) {
        return res.status(404).json({ message: "Pricing setting not found" });
      }

      res.json({ message: "Pricing setting deleted successfully" });
    } catch (error) {
      console.error("Error deleting pricing setting:", error);
      res.status(500).json({ message: "Failed to delete pricing setting" });
    }
  });

  // Register plant care dashboard routes
  const { registerPlantCareRoutes } = await import("./routes/plantCareRoutes");
  registerPlantCareRoutes(app);

  const httpServer = createServer(app);
  return httpServer;
}
