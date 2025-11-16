import { Router } from "express";
import { type IStorage } from "../storage";

export function createAnalyticsRouter(storage: IStorage) {
  const router = Router();

  // Watering frequency vs health events analytics
  router.get("/watering-health", async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const data = await storage.getWateringFrequencyVsHealth(req.user.id);
      res.json(data);
    } catch (error) {
      console.error("Error fetching watering-health analytics:", error);
      res.status(500).json({ message: "Failed to fetch analytics" });
    }
  });

  // Tasks overdue heatmap
  router.get("/tasks-overdue", async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const data = await storage.getTasksOverdueHeatmap(req.user.id);
      res.json(data);
    } catch (error) {
      console.error("Error fetching tasks-overdue analytics:", error);
      res.status(500).json({ message: "Failed to fetch analytics" });
    }
  });

  // Harvest analytics (by plant, month, or bed)
  router.get("/harvest/:groupBy", async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const groupBy = req.params.groupBy as 'plant' | 'month' | 'bed';
      if (!['plant', 'month', 'bed'].includes(groupBy)) {
        return res.status(400).json({ message: "Invalid groupBy parameter. Must be 'plant', 'month', or 'bed'" });
      }

      const data = await storage.getHarvestAnalytics(req.user.id, groupBy);
      res.json(data);
    } catch (error) {
      console.error(`Error fetching harvest analytics:`, error);
      res.status(500).json({ message: "Failed to fetch analytics" });
    }
  });

  // Success rate by variety
  router.get("/success-rate/variety", async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const data = await storage.getSuccessRateByVariety(req.user.id);
      res.json(data);
    } catch (error) {
      console.error("Error fetching success rate by variety:", error);
      res.status(500).json({ message: "Failed to fetch analytics" });
    }
  });

  // Success rate by season
  router.get("/success-rate/season", async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const data = await storage.getSuccessRateBySeason(req.user.id);
      res.json(data);
    } catch (error) {
      console.error("Error fetching success rate by season:", error);
      res.status(500).json({ message: "Failed to fetch analytics" });
    }
  });

  return router;
}
