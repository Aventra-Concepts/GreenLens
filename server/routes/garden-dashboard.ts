import type { Express } from "express";
import { requireAuth } from "../middleware/auth";
import { storage } from "../storage";
import { z } from "zod";
import { 
  insertGardenPlantSchema, 
  insertPlantDiseaseLogSchema,
  insertPlantTimelineEntrySchema,
  insertPlantPhotoSchema
} from "@shared/schema";

export function registerGardenDashboardRoutes(app: Express) {
  
  // Premium Garden Dashboard API
  app.get("/api/premium-garden-dashboard", requireAuth, async (req, res) => {
    try {
      // Mock premium dashboard data
      const dashboardData = {
        user: {
          id: "user123",
          firstName: "John",
          lastName: "Gardner",
          email: "john@example.com",
          profileImageUrl: null,
          subscriptionPlan: "Premium Plan",
          subscriptionPlanId: "premium",
          joinDate: new Date().toISOString(),
        },
        analytics: {
          totalPlants: 15,
          healthyPlants: 12,
          plantsNeedingCare: 2,
          plantsDiagnosed: 9,
          achievementScore: 150,
          gardenLevel: 4,
          experiencePoints: 375,
          streakDays: 12,
          monthlyGrowth: 3,
        },
        recentActivity: [
          {
            id: "1",
            type: 'identification',
            title: 'Identified Rose Bush',
            description: 'Successfully identified with 95% confidence',
            timestamp: '2 hours ago',
            status: 'success'
          },
          {
            id: "2", 
            type: 'care_plan',
            title: 'Care Plan Updated',
            description: 'New watering schedule for your tomatoes',
            timestamp: '1 day ago',
            status: 'info'
          }
        ],
        plants: [
          {
            id: "plant1",
            species: "Rosa gallica",
            commonName: "French Rose",
            confidence: 95,
            healthStatus: 'healthy',
            lastCared: '2 days ago',
            nextCareDate: 'Tomorrow',
            careTasks: ['Water regularly', 'Check for pests', 'Prune dead leaves'],
            imageUrl: null
          },
          {
            id: "plant2",
            species: "Solanum lycopersicum", 
            commonName: "Tomato Plant",
            confidence: 88,
            healthStatus: 'needs_care',
            lastCared: '3 days ago',
            nextCareDate: 'Today',
            careTasks: ['Water deeply', 'Add fertilizer', 'Support stems'],
            imageUrl: null
          }
        ],
        weatherData: {
          temperature: 72,
          humidity: 65,
          conditions: "Partly Cloudy",
          uvIndex: 6,
          recommendation: "Great weather for outdoor gardening! Consider watering your outdoor plants in the early morning to maximize water absorption."
        },
        aiInsights: [
          {
            type: 'tip',
            title: 'Optimal Watering Schedule',
            content: 'Based on your garden\'s composition and current weather conditions, we recommend watering your plants every 2-3 days in the morning for best results.',
            priority: 'high'
          },
          {
            type: 'opportunity',
            title: 'Seasonal Plant Suggestions',
            content: 'Fall is approaching! Consider adding chrysanthemums or ornamental kale to your garden for beautiful autumn colors.',
            priority: 'medium'
          }
        ]
      };

      res.json(dashboardData);
    } catch (error) {
      console.error("Error fetching premium garden dashboard:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Free Tier Garden Dashboard API
  app.get("/api/free-garden-dashboard", requireAuth, async (req, res) => {
    try {
      // Mock free tier dashboard data
      const dashboardData = {
        user: {
          id: "user456",
          firstName: "Jane",
          lastName: "Smith",
          email: "jane@example.com",
          profileImageUrl: null,
          subscriptionPlan: "Free Plan",
          subscriptionPlanId: "free",
          joinDate: new Date().toISOString(),
        },
        basicStats: {
          totalPlants: 3,
          plantsIdentified: 3,
          freeUsageRemaining: 7,
          freeUsageLimit: 10
        },
        recentPlants: [
          {
            id: "plant1",
            commonName: "Sunflower",
            species: "Helianthus annuus",
            confidence: 92,
            dateAdded: '3 days ago',
            imageUrl: null
          },
          {
            id: "plant2",
            commonName: "Lavender",
            species: "Lavandula angustifolia",
            confidence: 87,
            dateAdded: '1 week ago', 
            imageUrl: null
          }
        ],
        limitations: {
          maxPlantsPerMonth: 10,
          advancedFeaturesLocked: [
            'Advanced Health Diagnostics',
            'AI-Powered Care Plans',
            'Weather Integration',
            'Disease Detection',
            'Growth Tracking',
            'Expert Consultations',
            'Unlimited Plant Identifications',
            'Priority Support'
          ],
          premiumBenefits: [
            'Unlimited Plant Identifications',
            'AI Health Diagnostics',
            'Personalized Care Plans',
            'Weather Integration',
            'Disease Detection & Treatment',
            'Growth Progress Tracking',
            'Expert Plant Consultations',
            'Advanced Analytics Dashboard',
            'Premium Plant Database Access',
            'Priority Customer Support'
          ]
        }
      };

      res.json(dashboardData);
    } catch (error) {
      console.error("Error fetching free garden dashboard:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // ===== PLANT DIARY API ROUTES =====
  
  // GET all plants for authenticated user
  app.get("/api/garden/plants", requireAuth, async (req, res) => {
    try {
      const userId = req.user!.id;
      const plants = await storage.getGardenPlants(userId);
      res.json(plants);
    } catch (error) {
      console.error("Error fetching garden plants:", error);
      res.status(500).json({ error: "Failed to fetch plants" });
    }
  });

  // POST create a new plant
  app.post("/api/garden/plants", requireAuth, async (req, res) => {
    try {
      const userId = req.user!.id;
      const validatedData = insertGardenPlantSchema.parse(req.body);
      
      const newPlant = await storage.createGardenPlant({
        ...validatedData,
        userId,
      });
      
      res.status(201).json(newPlant);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid plant data", details: error.errors });
      }
      console.error("Error creating plant:", error);
      res.status(500).json({ error: "Failed to create plant" });
    }
  });

  // PUT update a plant
  app.put("/api/garden/plants/:id", requireAuth, async (req, res) => {
    try {
      const userId = req.user!.id;
      const plantId = req.params.id;
      
      // Validate and sanitize updates - remove protected fields
      const updateSchema = insertGardenPlantSchema.partial().omit({
        userId: true,
        isActive: true,
      });
      
      const validatedUpdates = updateSchema.parse(req.body);
      const updatedPlant = await storage.updateGardenPlant(plantId, userId, validatedUpdates);
      
      if (!updatedPlant) {
        return res.status(404).json({ error: "Plant not found" });
      }
      
      res.json(updatedPlant);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid update data", details: error.errors });
      }
      console.error("Error updating plant:", error);
      res.status(500).json({ error: "Failed to update plant" });
    }
  });

  // DELETE a plant
  app.delete("/api/garden/plants/:id", requireAuth, async (req, res) => {
    try {
      const userId = req.user!.id;
      const plantId = req.params.id;
      
      await storage.deleteGardenPlant(plantId, userId);
      res.json({ success: true, message: "Plant deleted successfully" });
    } catch (error) {
      console.error("Error deleting plant:", error);
      res.status(500).json({ error: "Failed to delete plant" });
    }
  });

  // GET disease logs for a plant
  app.get("/api/garden/plants/:plantId/diseases", requireAuth, async (req, res) => {
    try {
      const userId = req.user!.id;
      const plantId = req.params.plantId;
      
      const diseases = await storage.getPlantDiseaseLogs(plantId, userId);
      res.json(diseases);
    } catch (error) {
      console.error("Error fetching disease logs:", error);
      res.status(500).json({ error: "Failed to fetch disease logs" });
    }
  });

  // POST add a disease log for a plant
  app.post("/api/garden/plants/:plantId/diseases", requireAuth, async (req, res) => {
    try {
      const userId = req.user!.id;
      const plantId = req.params.plantId;
      
      // CRITICAL SECURITY: Verify plant belongs to user before adding disease log
      const plant = await storage.getGardenPlant(plantId, userId);
      if (!plant) {
        return res.status(404).json({ error: "Plant not found or access denied" });
      }
      
      const validatedData = insertPlantDiseaseLogSchema.parse(req.body);
      const diseaseLog = await storage.createPlantDiseaseLog({
        ...validatedData,
        plantId,
        userId,
      });
      
      res.status(201).json(diseaseLog);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid disease log data", details: error.errors });
      }
      console.error("Error creating disease log:", error);
      res.status(500).json({ error: "Failed to create disease log" });
    }
  });

  // ======================
  // Plant Timeline Routes
  // ======================

  // GET timeline entries for a plant
  app.get("/api/garden/plants/:plantId/timeline", requireAuth, async (req, res) => {
    try {
      const userId = req.user!.id;
      const plantId = req.params.plantId;
      
      // Verify plant belongs to user
      const plant = await storage.getGardenPlant(plantId, userId);
      if (!plant) {
        return res.status(404).json({ error: "Plant not found or access denied" });
      }
      
      const timeline = await storage.getPlantTimeline(plantId, userId);
      res.json(timeline);
    } catch (error) {
      console.error("Error fetching timeline:", error);
      res.status(500).json({ error: "Failed to fetch timeline" });
    }
  });

  // POST create timeline entry for a plant
  app.post("/api/garden/plants/:plantId/timeline", requireAuth, async (req, res) => {
    try {
      const userId = req.user!.id;
      const plantId = req.params.plantId;
      
      // Verify plant belongs to user
      const plant = await storage.getGardenPlant(plantId, userId);
      if (!plant) {
        return res.status(404).json({ error: "Plant not found or access denied" });
      }
      
      const validatedData = insertPlantTimelineEntrySchema.parse(req.body);
      const timelineEntry = await storage.createTimelineEntry({
        ...validatedData,
        plantId,
        userId,
      });
      
      res.status(201).json(timelineEntry);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid timeline entry data", details: error.errors });
      }
      console.error("Error creating timeline entry:", error);
      res.status(500).json({ error: "Failed to create timeline entry" });
    }
  });

  // PUT update timeline entry
  app.put("/api/garden/timeline/:entryId", requireAuth, async (req, res) => {
    try {
      const userId = req.user!.id;
      const entryId = req.params.entryId;
      
      const updateSchema = insertPlantTimelineEntrySchema.partial().omit({
        plantId: true,
      });
      
      const validatedUpdates = updateSchema.parse(req.body);
      const updatedEntry = await storage.updateTimelineEntry(entryId, userId, validatedUpdates);
      
      if (!updatedEntry) {
        return res.status(404).json({ error: "Timeline entry not found" });
      }
      
      res.json(updatedEntry);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid update data", details: error.errors });
      }
      console.error("Error updating timeline entry:", error);
      res.status(500).json({ error: "Failed to update timeline entry" });
    }
  });

  // DELETE timeline entry
  app.delete("/api/garden/timeline/:entryId", requireAuth, async (req, res) => {
    try {
      const userId = req.user!.id;
      const entryId = req.params.entryId;
      
      await storage.deleteTimelineEntry(entryId, userId);
      res.json({ success: true, message: "Timeline entry deleted successfully" });
    } catch (error) {
      console.error("Error deleting timeline entry:", error);
      res.status(500).json({ error: "Failed to delete timeline entry" });
    }
  });

  // ====================
  // Plant Photo Routes
  // ====================

  // GET photos for a plant
  app.get("/api/garden/plants/:plantId/photos", requireAuth, async (req, res) => {
    try {
      const userId = req.user!.id;
      const plantId = req.params.plantId;
      
      // Verify plant belongs to user
      const plant = await storage.getGardenPlant(plantId, userId);
      if (!plant) {
        return res.status(404).json({ error: "Plant not found or access denied" });
      }
      
      const photos = await storage.getPlantPhotos(plantId, userId);
      res.json(photos);
    } catch (error) {
      console.error("Error fetching photos:", error);
      res.status(500).json({ error: "Failed to fetch photos" });
    }
  });

  // POST create photo for a plant
  app.post("/api/garden/plants/:plantId/photos", requireAuth, async (req, res) => {
    try {
      const userId = req.user!.id;
      const plantId = req.params.plantId;
      
      // Verify plant belongs to user
      const plant = await storage.getGardenPlant(plantId, userId);
      if (!plant) {
        return res.status(404).json({ error: "Plant not found or access denied" });
      }
      
      const validatedData = insertPlantPhotoSchema.parse(req.body);
      const photo = await storage.createPlantPhoto({
        ...validatedData,
        plantId,
        userId,
      });
      
      res.status(201).json(photo);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid photo data", details: error.errors });
      }
      console.error("Error creating photo:", error);
      res.status(500).json({ error: "Failed to create photo" });
    }
  });

  // PUT update photo
  app.put("/api/garden/photos/:photoId", requireAuth, async (req, res) => {
    try {
      const userId = req.user!.id;
      const photoId = req.params.photoId;
      
      const updateSchema = insertPlantPhotoSchema.partial().omit({
        plantId: true,
      });
      
      const validatedUpdates = updateSchema.parse(req.body);
      const updatedPhoto = await storage.updatePlantPhoto(photoId, userId, validatedUpdates);
      
      if (!updatedPhoto) {
        return res.status(404).json({ error: "Photo not found" });
      }
      
      res.json(updatedPhoto);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid update data", details: error.errors });
      }
      console.error("Error updating photo:", error);
      res.status(500).json({ error: "Failed to update photo" });
    }
  });

  // DELETE photo
  app.delete("/api/garden/photos/:photoId", requireAuth, async (req, res) => {
    try {
      const userId = req.user!.id;
      const photoId = req.params.photoId;
      
      await storage.deletePlantPhoto(photoId, userId);
      res.json({ success: true, message: "Photo deleted successfully" });
    } catch (error) {
      console.error("Error deleting photo:", error);
      res.status(500).json({ error: "Failed to delete photo" });
    }
  });

  // POST set featured photo
  app.post("/api/garden/photos/:photoId/feature", requireAuth, async (req, res) => {
    try {
      const userId = req.user!.id;
      const photoId = req.params.photoId;
      const { plantId } = req.body;
      
      if (!plantId) {
        return res.status(400).json({ error: "plantId is required" });
      }
      
      // Verify plant belongs to user
      const plant = await storage.getGardenPlant(plantId, userId);
      if (!plant) {
        return res.status(404).json({ error: "Plant not found or access denied" });
      }
      
      await storage.setFeaturedPhoto(photoId, plantId, userId);
      res.json({ success: true, message: "Featured photo updated successfully" });
    } catch (error) {
      console.error("Error setting featured photo:", error);
      res.status(500).json({ error: "Failed to set featured photo" });
    }
  });
}