import type { Express } from "express";
import { createServer, type Server } from "http";
import multer from "multer";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
// plantIdService imported lazily when needed
import { plantsCatalogService } from "./services/plantsCatalog";
import { geminiService } from "./services/gemini";
import { carePlannerService } from "./services/carePlanner";
import { pdfService } from "./services/pdf";
import { paymentService } from "./services/payments";
import { plantNamesService } from "./services/plantNames";
import { insertPlantResultSchema, insertBlogPostSchema, insertReviewSchema } from "@shared/schema";
import { trackUserLogin, trackPlantIdentification, trackSubscriptionPurchase, trackPdfDownload } from "./middleware/activityTracker";

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
    files: 3,
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  },
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Plant identification endpoint
  app.post("/api/identify", isAuthenticated, upload.array('images', 3), async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
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

      // Step 1: Quality assessment with Gemini
      const qualityCheck = await geminiService.assessImageQuality(images);
      if (!qualityCheck.suitable) {
        return res.status(400).json({ 
          message: "Image quality insufficient for identification",
          suggestions: qualityCheck.suggestions 
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
        diseaseAdvice = await geminiService.diseaseAdvice({
          diseaseFindings: healthAssessment.diseases
        });
      }

      // Step 6: Save to database and update usage tracking
      if (isUsingFreeTier) {
        await storage.incrementFreeTierUsage(userId);
      }

      const plantResult = await storage.createPlantResult({
        userId,
        images: files.map(file => ({ 
          name: file.originalname,
          size: file.size,
          type: file.mimetype 
        })),
        species: enrichedSpecies,
        confidence: identification.confidence.toString(),
        careJSON: carePlan,
        diseasesJSON: diseaseAdvice,
        isFreeIdentification: isUsingFreeTier,
      });

      // Get updated free tier status for response
      let freeTierStatus = null;
      if (isUsingFreeTier) {
        freeTierStatus = await storage.checkFreeTierEligibility(userId);
      }

      res.json({
        id: plantResult.id,
        species: enrichedSpecies,
        confidence: identification.confidence,
        carePlan,
        diseases: diseaseAdvice,
        createdAt: plantResult.createdAt,
        freeTierStatus,
      });

    } catch (error) {
      console.error("Error in plant identification:", error);
      res.status(500).json({ message: "Failed to identify plant" });
    }
  });

  // Generate PDF report
  app.post("/api/generate-pdf", isAuthenticated, async (req: any, res) => {
    try {
      const { resultId } = req.body;
      const userId = req.user.claims.sub;

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

  // Payment endpoints
  app.post("/api/checkout", isAuthenticated, async (req: any, res) => {
    try {
      const { provider, planId } = req.body;
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const checkoutUrl = await paymentService.createCheckout(provider, {
        userId,
        userEmail: user.email || '',
        planId,
      });

      res.json({ checkoutUrl });

    } catch (error) {
      console.error("Error creating checkout:", error);
      res.status(500).json({ message: "Failed to create checkout session" });
    }
  });

  // Payment webhooks
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
  app.get("/api/results/:id", isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.claims.sub;

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

  app.get("/api/my-garden", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
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
  app.post("/api/admin/blog", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const data = insertBlogPostSchema.parse({ ...req.body, authorId: userId });
      
      const post = await storage.createBlogPost(data);
      res.json(post);
    } catch (error) {
      console.error("Error creating blog post:", error);
      res.status(500).json({ message: "Failed to create blog post" });
    }
  });

  // Subscription status endpoint
  app.get("/api/subscription", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const subscription = await storage.getUserSubscription(userId);
      
      if (!subscription) {
        return res.json({ status: 'none' });
      }

      res.json(subscription);
    } catch (error) {
      console.error("Error fetching subscription:", error);
      res.status(500).json({ message: "Failed to fetch subscription" });
    }
  });

  // Free tier status endpoint
  app.get("/api/free-tier-status", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
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

  app.put("/api/user/language", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
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
      const carePlan = result.careJSON as any;
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
  app.post("/api/health-check/:plantId", isAuthenticated, upload.array('images', 3), async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
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
        advice = await geminiService.diseaseAdvice({
          diseaseFindings: healthAssessment.diseases
        });
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

  app.post("/api/reviews", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
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

  app.post("/api/admin/banner-settings", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
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

  app.post("/api/admin/banner-image", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
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

  const httpServer = createServer(app);
  return httpServer;
}
