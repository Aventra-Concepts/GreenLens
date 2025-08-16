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
import { insertPlantResultSchema, insertBlogPostSchema } from "@shared/schema";

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

      // Check subscription limits for free users
      const subscription = await storage.getUserSubscription(userId);
      if (!subscription || subscription.status !== 'active') {
        const userResults = await storage.getUserPlantResults(userId);
        const thisMonth = new Date();
        thisMonth.setDate(1);
        thisMonth.setHours(0, 0, 0, 0);
        
        const monthlyCount = userResults.filter(result => 
          result.createdAt && result.createdAt >= thisMonth
        ).length;
        
        if (monthlyCount >= 5) {
          return res.status(402).json({ 
            message: "Monthly limit reached. Please upgrade to Pro for unlimited identifications." 
          });
        }
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

      // Step 3: Get catalog information
      const catalogInfo = await plantsCatalogService.getPlantInfo(identification.species.scientificName);

      // Step 4: Generate care plan
      const carePlan = await carePlannerService.generateCarePlan({
        identification,
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

      // Step 6: Save to database
      const plantResult = await storage.createPlantResult({
        userId,
        images: files.map(file => ({ 
          name: file.originalname,
          size: file.size,
          type: file.mimetype 
        })),
        species: identification.species,
        confidence: identification.confidence.toString(),
        careJSON: carePlan,
        diseasesJSON: diseaseAdvice,
      });

      res.json({
        id: plantResult.id,
        species: identification.species,
        confidence: identification.confidence,
        carePlan,
        diseases: diseaseAdvice,
        createdAt: plantResult.createdAt,
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

  const httpServer = createServer(app);
  return httpServer;
}
